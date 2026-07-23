export class BaseMapper {
    static toEntity(storageObject) {
        throw new Error("toEntity must be implemented by subclass");
    }

    static toStorage(entity) {
        throw new Error("toStorage must be implemented by subclass");
    }
}
