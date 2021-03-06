declare class Consumer {
    interval: number;
    minAtmsec: number;
    date: Date;
    minute: number;
    sec: number;
    msec: number;
    timestamp: number;
    timeGroup: number;
    rabbit: any;
    intervalId: object;
    constructor();
    /**
     * Определить какая в данный момент временная группа. Необходимо для корректного получения сообщений
     */
    determineTimeGroup(): void;
    /**
     * Приступить к получению сообщений из rabbit
     */
    startReceivingMessages(): object;
    /**
     * Сменить группу мониторинга.
     */
    checkAndAutoIncrementGroup(): void;
    /**
     * Приступить к получению сообщений из текущий группы, с дальнешим переходом по следующим группам.
     */
    startSetInterval(): void;
}
export = Consumer;
