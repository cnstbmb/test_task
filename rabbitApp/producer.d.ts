declare class DataHandler {
    private data;
    brokenData: boolean;
    query: string;
    producerId: string;
    constructor(producerId: string);
    /**
     * Проверяем JSON.
     * - id является числом
     * - group является числом
     * - group числом от 1 до 12
     * - text не является пустой строкой
     * @returns {boolean}
     */
    checkJSON(): boolean;
    /**
     * Получаем данные из запроса. Преобразовываем в JSON.
     * @param request - string
     */
    getData(request: {
        url: string;
    }): boolean;
    /**
     * Проверяем входные данные. Соотвествует ли JSON заданному стандарту.
     * @returns {boolean}
     */
    checkData(): boolean;
    /**
     * Отправялем полученные данные в rabbitMq
     */
    sendDataToRabbit(): void;
}
export = DataHandler;
