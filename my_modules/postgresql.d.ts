declare class Postgresql {
    client: any;
    constructor();
    private connect();
    private isConnectded();
    read(query: string): void;
}
export = Postgresql;
