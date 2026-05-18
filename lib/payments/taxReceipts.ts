// lib/payments/taxReceipts.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TaxReceiptGenerator {
    async generateReceipt(transaction: any) {
        const receipt = {
            receiptNumber: `RCP-${transaction.id}-${Date.now()}`,
            date: new Date().toISOString(),
            donor: {
                name: transaction.userName,
                email: transaction.userEmail,
                address: transaction.userAddress,
            },
            gift: {
                amount: transaction.amount,
                currency: transaction.currency,
                method: transaction.paymentMethod,
                date: transaction.createdAt,
                purpose: transaction.purpose,
            },
            taxInfo: {
                organizationName: 'Digital Church OS',
                ein: process.env.ORGANIZATION_EIN || '12-3456789',
                isTaxDeductible: true,
                goodsOrServices: 'None', // No goods received
                cryptoTreatment: this.getCryptoTaxTreatment(transaction),
            },
            signatures: {
                digitalSignature: this.generateDigitalSignature(transaction),
                qrCode: this.generateQRCode(transaction),
            },
        };

        // Mock save, since the prisma schema does not have a TaxReceipt model exactly like this
        console.log(`[TaxReceiptGenerator] Generated receipt ${receipt.receiptNumber}`);

        return receipt;
    }

    private getCryptoTaxTreatment(transaction: any) {
        if (transaction.paymentMethod?.includes('crypto') || transaction.crypto) {
            return {
                notice: "Cryptocurrency is treated as property by the IRS [citation:1]",
                valueAtDonation: transaction.amount,
                fairMarketValue: transaction.amount,
                noGoodsReceived: true,
                acknowledgement: "No goods or services were provided in exchange for this cryptocurrency gift.",
            };
        }
        return null;
    }

    private generateDigitalSignature(t: any) { return `sig_${Date.now()}_${t.id}`; }
    private generateQRCode(t: any) { return `qr_${t.id}`; }
}
