class DependencyContainer {
    constructor() {
        this.dependencies = new Map();
    }

    register(name, instance) {
        this.dependencies.set(name, instance);
    }

    resolve(name) {
        if (!this.dependencies.has(name)) {
            throw new Error(`Dependency ${name} not found`);
        }
        return this.dependencies.get(name);
    }
}

export const container = new DependencyContainer();
