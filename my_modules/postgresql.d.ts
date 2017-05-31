declare class Postgresql {
    client: any;
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
    /**
     * Записать данные в БД
     * @param query - сообщение для записи
     */
    write(query: string): void;
}
export = Postgresql;
