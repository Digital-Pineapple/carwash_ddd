
export interface TypeCarEntity {
    _id              :   string;
    name             :   string;
    status           ?:   boolean;
    typeCar_image    ?:   string;
    createdAt       ?:   NativeDate;
    updatedAt       ?:   NativeDate;
}