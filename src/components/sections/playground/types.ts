export type ResultKind = "success" | "mistake" | "info";
export type OnResult = (kind: ResultKind, message: string) => void;
