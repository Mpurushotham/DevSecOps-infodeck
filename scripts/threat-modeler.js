// Advanced Threat Modeling functionality
class ThreatModeler {
    constructor() {
        this.canvas = document.getElementById('threat-canvas');
        this.components = [];
        this.connections = [];
        this.selectedTool = 'select';
        this.draggedComponent = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadThreatLibrary();
        this.renderCanvas();
    }

    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedTool = btn.dataset.tool;
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Component dragging
        document.querySelectorAll('.component-item').forEach(component => {
            component.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', component.dataset.component);
                this.draggedComponent = component.dataset.component;
            });
        });

        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedComponent) {
                this.addComponent(this.draggedComponent, e.offsetX, e.offsetY);
                this.draggedComponent = null;
            }
        });

        // Threat category switching
        document.querySelectorAll('.threat-category').forEach(category => {
            category.addEventListener('click', (e) => {
                document.querySelectorAll('.threat-category').forEach(c => c.classList.remove('active'));
                category.classList.add('active');
                this.switchThreatModel(category.dataset.category);
            });
        });
    }

    addComponent(type, x, y) {
        const component = {
            id: `comp_${Date.now()}`,
            type: type,
            x: x,
            y: y,
            threats: []
        };

        this.components.push(component);
        this.analyzeThreats(component);
        this.renderCanvas();
    }

    analyzeThreats(component) {
        const threatLibrary = this.getThreatLibrary();
        const componentThreats = threatLibrary[component.type] || [];

        component.threats = componentThreats.map(threat => ({
            ...threat,
            id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'open',
            risk: this.calculateRisk(threat)
        }));
    }

    calculateRisk(threat) {
        // Simple risk calculation based on impact and likelihood
        const riskMatrix = {
            'critical': 5,
            'high': 4,
            'medium': 3,
            'low': 2,
            'info': 1
        };

        const impactScore = riskMatrix[threat.impact] || 3;
        const likelihoodScore = riskMatrix[threat.likelihood] || 3;
        
        const riskScore = impactScore * likelihoodScore;
        
        if (riskScore >= 20) return 'critical';
        if (riskScore >= 12) return 'high';
        if (riskScore >= 6) return 'medium';
        return 'low';
    }

    getThreatLibrary() {
        return {
            'web-server': [
                {
                    type: 'spoofing',
                    description: 'Server impersonation or DNS spoofing',
                    impact: 'high',
                    likelihood: 'medium',
                    mitigation: 'Implement TLS, use certificate pinning'
                },
                {
                    type: 'tampering',
                    description: 'Unauthorized modification of server content',
                    impact: 'high',
                    likelihood: 'medium',
                    mitigation: 'File integrity monitoring, WAF protection'
                }
            ],
            'database': [
                {
                    type: 'information-disclosure',
                    description: 'Unauthorized data access',
                    impact: 'critical',
                    likelihood: 'high',
                    mitigation: 'Encryption at rest, proper access controls'
                },
                {
                    type: 'tampering',
                    description: 'Data manipulation through SQL injection',
                    impact: 'critical',
                    likelihood: 'high',
                    mitigation: 'Parameterized queries, input validation'
                }
            ],
            'api': [
                {
                    type: 'spoofing',
                    description: 'API key theft or misuse',
                    impact: 'high',
                    likelihood: 'medium',
                    mitigation: 'API key rotation, request signing'
                },
                {
                    type: 'elevation',
                    description: 'Privilege escalation through API endpoints',
                    impact: 'high',
                    likelihood: 'medium',
                    mitigation: 'Proper authorization checks'
                }
            ],
            'auth': [
                {
                    type: 'spoofing',
                    description: 'Authentication bypass',
                    impact: 'critical',
                    likelihood: 'medium',
                    mitigation: 'Multi-factor authentication, strong session management'
                },
                {
                    type: 'repudiation',
                    description: 'Lack of audit trails for auth events',
                    impact: 'medium',
                    likelihood: 'high',
                    mitigation: 'Comprehensive logging and monitoring'
                }
            ]
        };
    }

    renderCanvas() {
        this.canvas.innerHTML = '';
        
        // Render connections first
        this.connections.forEach(connection => {
            this.renderConnection(connection);
        });

        // Render components
        this.components.forEach(component => {
            this.renderComponent(component);
        });

        this.updateThreatList();
    }

    renderComponent(component) {
        const compElement = document.createElement('div');
        compElement.className = `canvas-component ${component.type} ${component.threats.some(t => t.risk === 'critical') ? 'vulnerable' : ''}`;
        compElement.style.left = `${component.x}px`;
        compElement.style.top = `${component.y}px`;
        compElement.draggable = true;

        const iconMap = {
            'web-server': 'fas fa-server',
            'database': 'fas fa-database',
            'api': 'fas fa-plug',
            'auth': 'fas fa-user-shield'
        };

        compElement.innerHTML = `
            <div style="text-align: center;">
                <i class="${iconMap[component.type]}"></i>
                <div style="margin-top: 0.5rem; font-weight: 600;">${this.formatComponentName(component.type)}</div>
                ${component.threats.length > 0 ? 
                    `<div style="margin-top: 0.25rem; font-size: 0.8rem; color: #dc2626;">
                        ${component.threats.filter(t => t.risk === 'critical').length} Critical
                    </div>` : ''
                }
            </div>
        `;

        // Make component draggable
        compElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', component.id);
        });

        compElement.addEventListener('click', () => {
            this.showComponentDetails(component);
        });

        this.canvas.appendChild(compElement);
    }

    showComponentDetails(component) {
        // Create a modal or update details panel with component information
        const detailsPanel = document.querySelector('.threat-details .details-content');
        detailsPanel.innerHTML = `
            <div class="component-details">
                <h4>${this.formatComponentName(component.type)}</h4>
                <div class="threat-list">
                    ${component.threats.map(threat => `
                        <div class="threat-item stride-${threat.type}">
                            <div class="threat-header">
                                <span class="threat-type">${this.formatThreatType(threat.type)}</span>
                                <span class="threat-risk ${threat.risk}">${threat.risk}</span>
                            </div>
                            <p>${threat.description}</p>
                            <div class="threat-mitigation">
                                <strong>Mitigation:</strong> ${threat.mitigation}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    formatComponentName(type) {
        const names = {
            'web-server': 'Web Server',
            'database': 'Database',
            'api': 'API Gateway',
            'auth': 'Auth Service'
        };
        return names[type] || type;
    }

    formatThreatType(type) {
        const types = {
            'spoofing': 'Spoofing',
            'tampering': 'Tampering',
            'repudiation': 'Repudiation',
            'information-disclosure': 'Information Disclosure',
            'dos': 'Denial of Service',
            'elevation': 'Privilege Escalation'
        };
        return types[type] || type;
    }

    updateThreatList() {
        const allThreats = this.components.flatMap(comp => comp.threats);
        const criticalThreats = allThreats.filter(t => t.risk === 'critical');
        
        // Update dashboard metrics
        this.updateSecurityMetrics(criticalThreats.length);
    }

    updateSecurityMetrics(criticalCount) {
        const scoreElement = document.querySelector('.metric-value');
        if (scoreElement) {
            const baseScore = 100;
            const penalty = criticalCount * 5;
            const finalScore = Math.max(baseScore - penalty, 0);
            scoreElement.textContent = `${finalScore}%`;
            
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${finalScore}%`;
            }
        }
    }

    switchThreatModel(modelType) {
        // Implement different threat modeling methodologies
        console.log(`Switching to ${modelType} threat model`);
        // This would load different threat libraries and analysis methods
    }

    generateThreatReport() {
        const report = {
            timestamp: new Date().toISOString(),
            components: this.components,
            summary: {
                totalComponents: this.components.length,
                totalThreats: this.components.reduce((sum, comp) => sum + comp.threats.length, 0),
                criticalThreats: this.components.reduce((sum, comp) => sum + comp.threats.filter(t => t.risk === 'critical').length, 0),
                highThreats: this.components.reduce((sum, comp) => sum + comp.threats.filter(t => t.risk === 'high').length, 0)
            },
            recommendations: this.generateRecommendations()
        };

        this.downloadReport(report);
    }

    generateRecommendations() {
        const recommendations = [];
        const criticalComponents = this.components.filter(comp => 
            comp.threats.some(t => t.risk === 'critical')
        );

        criticalComponents.forEach(comp => {
            comp.threats.filter(t => t.risk === 'critical').forEach(threat => {
                recommendations.push({
                    component: comp.type,
                    threat: threat.type,
                    recommendation: `Implement ${threat.mitigation}`,
                    priority: 'HIGH'
                });
            });
        });

        return recommendations;
    }

    downloadReport(report) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `threat-report-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

// Initialize threat modeler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const threatModeler = new ThreatModeler();
    
    // Export functionality
    document.getElementById('generate-threat-report').addEventListener('click', () => {
        threatModeler.generateThreatReport();
    });
});
