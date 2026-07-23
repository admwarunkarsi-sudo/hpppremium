import { container } from '../../core/dependencyContainer.js';
import { logger } from '../../core/logger.js';

export const NotificationTypes = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

export class NotificationService {
    constructor() {
        // Will initialize event bus when needed to avoid circular deps during boot
    }

    get eventBus() {
        try {
            return container.resolve('eventBus');
        } catch(e) {
            return null;
        }
    }

    notify(message, type = NotificationTypes.INFO) {
        logger.system(`[Notification ${type}] ${message}`);
        
        const bus = this.eventBus;
        if (bus) {
            bus.publish('ui:notification', { message, type });
        }
    }

    success(message) { this.notify(message, NotificationTypes.SUCCESS); }
    error(message) { this.notify(message, NotificationTypes.ERROR); }
    warning(message) { this.notify(message, NotificationTypes.WARNING); }
    info(message) { this.notify(message, NotificationTypes.INFO); }
}

export const notificationService = new NotificationService();
