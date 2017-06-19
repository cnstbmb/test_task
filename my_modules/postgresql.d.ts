declare class Postgresql {
    client: any;
    timeOutInterval: number;
    private messages;
    private errorEvents;
    private eventCounter;
    private sysError;
    private timeOutMessagesId;
    private timeOutErrorEventsId;
    private timeOutEventCounterId;
    private timeOutSysErrorId;
    constructor();
    /**
     * Проверяет существует ли соединение с базой данных
     * @returns {boolean}
     */
    private isConnected();
    read(query: string, cb: any): void;
    /**
     * Получить сообщения и данные о сообщениях из ДБ.
     * @param cb - полученные данные передаем в коллбэк
     */
    getRabbitEventsData(cb: any): void;
    initDataPackets(): void;
    addToMessagePacket(producerTime: number, consumerTime: number, message: string): void;
    addToErrorEventsPacket(consumerTime: number, query: string, message: string): void;
    addToEventCounterPacket(producerId: string, consumerTime: number): void;
    addToSysErrorPacket(error: string, consumerTime: number): void;
    private writeMessages();
    private writeErrorEvents();
    writeEventCounter(): void;
    private writeSysError();
    private copyDataPacket(table, data);
}
export = Postgresql;
