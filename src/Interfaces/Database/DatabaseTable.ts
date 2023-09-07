import Database from './Database';

export default interface DatabaseTable {
    name: string;
    parameters: {
        type: string;
        name: string;
    }[];
}
