export type BankWebhookEvent = {
    TerminalKey: string;
    OrderId: string;
    Success: boolean;
    Status: string;
    PaymentId: number;
    ErrorCode: string;
    Amount: number;
    CardId: number;
    Pan: string;
    ExpDate: string;
    Token: string;
    Data: any;
} 