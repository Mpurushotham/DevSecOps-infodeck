// Interactive Pipeline Builder
class PipelineBuilder {
    constructor() {
        this.pipelineStages = [];
        this.securityTools = {};
        this.currentPipeline = {};
        
        this.init();
    }

    init() {
        this.loadToolLibrary();
        this.setupDragAndDrop();
        this.setupEventListeners();
        this.loadSamplePipeline();
    }

    loadToolLibrary() {
        this.securityTools = {
            'sonarqube': {
                name: 'SonarQube',
                category: 'sast',
                stage: 'code',
                config: {
                    qualityGate: true,
                    securityHotspots: true
                }
            },
            'snyk': {
                name: 'Snyk Code',
                category: 'sast', 
                stage: 'code',
                config: {
                    severityThreshold: 'high',
                    failOnIssues: true
                }
            },
            'zap': {
                name: 'OWASP ZAP',
                category: 'dast',
                stage: 'test',
                config: {
                    scanType: 'full',
                    failOnHigh: true
                }
            },
            'trivy': {
                name: 'Trivy',
                category: 'container',
                stage: 'build',
                config: {
                    scanType: 'image,vulnerability',
                    severity: 'CRITICAL,HIGH'
                }
            },
            'pre-commit': {
                name: 'Pre-commit Hooks',
                category: 'sast',
                stage: 'code',
                config: {
                    hooks: ['secret-detection', 'sast-basic']
                }
            }
        };
    }

    setupDragAndDrop() {
        // Make tool items draggable
        document.querySelectorAll('.tool-item').forEach(tool => {
            tool.setAttribute('draggable', 'true');
            
            tool.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', tool.dataset.tool);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });

        // Setup drop zones
        document.querySelectorAll('.stage-tools').forEach(stage => {
            stage.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                stage.classList.add('drop-zone-active');
            });

            stage.addEventListener('dragleave', () => {
                stage.classList.remove('drop-zone-active');
            });

            stage.addEventListener('drop', (e) => {
                e.preventDefault();
                stage.classList.remove('drop-zone-active');
                
                const toolId = e.dataTransfer.getData('text/plain');
                const stageId = stage.dataset.stage;
                
                this.addToolToStage(toolId, stageId, stage);
            });
        });
    }

    addToolToStage(toolId, stageId, stageElement) {
        const toolConfig = this.securityTools[toolId];
        if (!toolConfig) return;

        const toolElement = document.createElement('div');
        toolElement.className = 'tool-item configured';
        toolElement.dataset.tool = toolId;
        toolElement.innerHTML = `
            <i class="fas fa-${this.getToolIcon(toolId)}"></i>
            <span>${toolConfig.name}</span>
            <button class="tool-config"><i class="fas fa-cog"></i></button>
            <button class="tool-remove"><i class="fas fa-times"></i></button>
        `;

        // Add configuration handler
        toolElement.querySelector('.tool-config').addEventListener('click', () => {
            this.showToolConfiguration(toolId, toolConfig);
        });

        // Add removal handler
        toolElement.querySelector('.tool-remove').addEventListener('click', () => {
            toolElement.remove();
            this.updatePipelineConfiguration();
        });

        stageElement.appendChild(toolElement);
        this.updatePipelineConfiguration();
    }

    getToolIcon(toolId) {
        const iconMap = {
            'sonarqube': 'chart-line',
            'snyk': 'shield-alt',
            'zap': 'spider',
            'trivy': 'box',
            'pre-commit': 'code-branch'
        };
        return iconMap[toolId] || 'toolbox';
    }

    showToolConfiguration(toolId, toolConfig) {
        // Create configuration modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Configure ${toolConfig.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="tool-config-form">
                        ${this.generateToolConfigForm(toolConfig)}
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="save-tool-config">Save Configuration</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Save configuration
        modal.querySelector('#save-tool-config').addEventListener('click', () => {
            this.saveToolConfiguration(toolId, modal);
            modal.remove();
        });
    }

    generateToolConfigForm(toolConfig) {
        let formHTML = '';
        
        Object.entries(toolConfig.config).forEach(([key, value]) => {
            formHTML += `
                <div class="form-field">
                    <label>${this.formatConfigKey(key)}</label>
                    ${this.generateConfigInput(key, value)}
                </div>
            `;
        });

        return formHTML;
    }

    generateConfigInput(key, value) {
        if (typeof value === 'boolean') {
            return `<input type="checkbox" name="${key}" ${value ? 'checked' : ''}>`;
        } else if (Array.isArray(value)) {
            return `<input type="text" name="${key}" value="${value.join(',')}">`;
        } else {
            return `<input type="text" name="${key}" value="${value}">`;
        }
    }

    formatConfigKey(key) {
        return key.split(/(?=[A-Z])/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    saveToolConfiguration(toolId, modal) {
        const form = modal.querySelector('#tool-config-form');
        const formData = new FormData(form);
        
        const config = {};
        for (let [key, value] of formData.entries()) {
            if (value === 'on') {
                config[key] = true;
            } else if (value.includes(',')) {
                config[key] = value.split(',');
            } else {
                config[key] = value;
            }
        }

        this.securityTools[toolId].config = { ...this.securityTools[toolId].config, ...config };
        this.updatePipelineConfiguration();
    }

    updatePipelineConfiguration() {
        this.currentPipeline = {
            stages: this.getConfiguredStages(),
            securityGates: this.getSecurityGates(),
            tools: this.getConfiguredTools()
        };

        this.updatePipelineVisualization();
        this.calculateSecurityScore();
    }

    getConfiguredStages() {
        const stages = [];
        document.querySelectorAll('.pipeline-stage').forEach(stageElement => {
            const stageId = stageElement.dataset.stage;
            const tools = Array.from(stageElement.querySelectorAll('.tool-item.configured'))
                .map(tool => tool.dataset.tool);
            
            stages.push({
                stage: stageId,
                tools: tools
            });
        });
        
        return stages;
    }

    getSecurityGates() {
        const gates = [];
        document.querySelectorAll('.config-item input[type="checkbox"]:checked').forEach(checkbox => {
            gates.push(checkbox.parentElement.textContent.trim());
        });
        return gates;
    }

    getConfiguredTools() {
        const tools = {};
        Object.keys(this.securityTools).forEach(toolId => {
            if (this.isToolConfigured(toolId)) {
                tools[toolId] = this.securityTools[toolId].config;
            }
        });
        return tools;
    }

    isToolConfigured(toolId) {
        return document.querySelector(`.tool-item.configured[data-tool="${toolId}"]`) !== null;
    }

    updatePipelineVisualization() {
        // Update the pipeline visualization based on current configuration
        const pipelineVisual = document.getElementById('pipeline-visual');
        if (!pipelineVisual) return;

        pipelineVisual.innerHTML = this.generatePipelineVisualization();
    }

    generatePipelineVisualization() {
        const stages = this.currentPipeline.stages || [];
        let visualization = '<div class="pipeline-flow">';
        
        stages.forEach((stage, index) => {
            const toolsCount = stage.tools.length;
            const securityLevel = this.calculateStageSecurityLevel(stage);
            
            visualization += `
                <div class="pipeline-stage ${securityLevel}">
                    <div class="stage-header">
                        <h4>${this.formatStageName(stage.stage)}</h4>
                        <i class="fas fa-${this.getStageIcon(stage.stage)}"></i>
                    </div>
                    <div class="stage-tools-count">
                        ${toolsCount} security tool${toolsCount !== 1 ? 's' : ''}
                    </div>
                    ${securityLevel === 'secure' ? 
                        '<div class="stage-status secure"><i class="fas fa-check"></i></div>' : 
                        '<div class="stage-status warning"><i class="fas fa-exclamation-triangle"></i></div>'
                    }
                </div>
            `;

            if (index < stages.length - 1) {
                visualization += '<div class="pipeline-connector"></div>';
            }
        });
        
        visualization += '</div>';
        return visualization;
    }

    calculateStageSecurityLevel(stage) {
        const criticalTools = ['snyk', 'zap', 'trivy'];
        const hasCriticalTools = stage.tools.some(tool => criticalTools.includes(tool));
        return hasCriticalTools ? 'secure' : 'warning';
    }

    formatStageName(stage) {
        const names = {
            'plan': 'Plan',
            'code': 'Code',
            'build': 'Build',
            'test': 'Test',
            'release': 'Release',
            'deploy': 'Deploy',
            'monitor': 'Monitor',
            'feedback': 'Feedback'
        };
        return names[stage] || stage;
    }

    getStageIcon(stage) {
        const icons = {
            'plan': 'project-diagram',
            'code': 'code',
            'build': 'cube',
            'test': 'vial',
            'release': 'rocket',
            'deploy': 'cloud-upload-alt',
            'monitor': 'chart-line',
            'feedback': 'comments'
        };
        return icons[stage] || 'circle';
    }

    calculateSecurityScore() {
        const totalStages = 8; // Total possible stages
        const configuredStages = this.currentPipeline.stages.filter(stage => 
            stage.tools.length > 0
        ).length;
        
        const score = Math.round((configuredStages / totalStages) * 100);
        this.updateSecurityScore(score);
    }

    updateSecurityScore(score) {
        const scoreElement = document.querySelector('.metric-value');
        if (scoreElement) {
            scoreElement.textContent = `${score}%`;
            
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${score}%`;
            }
        }
    }

    generatePipelineCode() {
        const pipelineConfig = {
            name: "DevSecOps Pipeline",
            on: {
                push: { branches: ["main"] },
                pull_request: { branches: ["main"] }
            },
            jobs: this.generatePipelineJobs()
        };

        const yaml = this.convertToYAML(pipelineConfig);
        this.downloadPipelineCode(yaml);
    }

    generatePipelineJobs() {
        const jobs = {};
        
        this.currentPipeline.stages.forEach(stage => {
            if (stage.tools.length > 0) {
                jobs[`${stage.stage}-security`] = {
                    'runs-on': 'ubuntu-latest',
                    steps: this.generateStageSteps(stage)
                };
            }
        });

        return jobs;
    }

    generateStageSteps(stage) {
        const steps = [
            {
                name: "Checkout code",
                uses: "actions/checkout@v3"
            }
        ];

        stage.tools.forEach(toolId => {
            const tool = this.securityTools[toolId];
            if (tool) {
                steps.push({
                    name: `Run ${tool.name}`,
                    uses: this.getToolAction(toolId),
                    with: tool.config
                });
            }
        });

        return steps;
    }

    getToolAction(toolId) {
        const actions = {
            'sonarqube': 'SonarSource/sonarqube-scan-action@v4',
            'snyk': 'snyk/actions/node@master',
            'zap': 'zaproxy/action-full-scan@v0.4.0',
            'trivy': 'aquasecurity/trivy-action@master'
        };
        return actions[toolId] || 'actions/checkout@v3';
    }

    convertToYAML(obj, indent = 0) {
        let yaml = '';
        const spaces = '  '.repeat(indent);
        
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                yaml += `${spaces}${key}:\n${this.convertToYAML(value, indent + 1)}`;
            } else if (Array.isArray(value)) {
                yaml += `${spaces}${key}:\n`;
                value.forEach(item => {
                    yaml += `${spaces}  - ${item}\n`;
                });
            } else {
                yaml += `${spaces}${key}: ${value}\n`;
            }
        }
        
        return yaml;
    }

    downloadPipelineCode(yamlContent) {
        const blob = new Blob([yamlContent], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '.github/workflows/devsecops-pipeline.yml';
        a.click();
        URL.revokeObjectURL(url);
    }

    loadSamplePipeline() {
        // Load a sample pipeline configuration
        const sampleTools = ['pre-commit', 'sonarqube', 'trivy', 'zap'];
        
        sampleTools.forEach(toolId => {
            const toolConfig = this.securityTools[toolId];
            if (toolConfig) {
                const stageElement = document.querySelector(`.stage-tools[data-stage="${toolConfig.stage}"]`);
                if (stageElement) {
                    this.addToolToStage(toolId, toolConfig.stage, stageElement);
                }
            }
        });
    }

    setupEventListeners() {
        document.getElementById('generate-pipeline').addEventListener('click', () => {
            this.generatePipelineCode();
        });

        document.getElementById('edit-pipeline').addEventListener('click', () => {
            // Switch to pipeline builder section
            document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
            document.getElementById('pipeline-builder').classList.add('active');
        });
    }
}

// Initialize pipeline builder
document.addEventListener('DOMContentLoaded', () => {
    const pipelineBuilder = new PipelineBuilder();
});
