export type Era = '70s' | '90s' | 'modern';
export interface ISPNode {
    id: string;
    name: string;
    bandwidth: number;
    traffic: number;
    level: number;
}
interface ISPStore {
    money: number;
    currentEra: Era;
    nodes: ISPNode[];
    totalData: number;
    logs: string[];
    tick: () => void;
    upgradeNode: (id: string) => void;
    addNode: (node: ISPNode) => void;
    setEra: (era: Era) => void;
    addLog: (msg: string, isCritical?: boolean) => void;
}
export declare const useISPStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ISPStore>>;
export {};
//# sourceMappingURL=useISPStore.d.ts.map