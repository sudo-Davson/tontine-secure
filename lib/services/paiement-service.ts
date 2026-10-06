// lib/services/paiement-service.ts

export type MethodePaiement = 'TMONEY' | 'FLOOZ';

export interface PaiementRequest {
  montant: number;
  telephone: string;
  reference: string;
  description?: string;
}

export interface PaiementResponse {
  success: boolean;
  transactionId?: string;
  reference?: string;
  message: string;
  isSimulated: boolean; // ← Indique si c'est simulé ou réel
  raw?: any;
}

export class PaiementService {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // ============================================
  // TMONEY (Mixx by Yas)
  // ============================================
  async payerTmoney(request: PaiementRequest): Promise<PaiementResponse> {
    // ============================================
    // 🚀 INTÉGRATION RÉELLE (à décommenter plus tard)
    // ============================================
    // if (this.isProduction) {
    //   try {
    //     // 1. Obtenir le token
    //     const tokenResponse = await fetch(
    //       `${process.env.TMONEY_ENDPOINT}/token`,
    //       {
    //         method: 'POST',
    //         headers: {
    //           'Authorization': `Basic ${Buffer.from(
    //             `${process.env.TMONEY_API_KEY}:${process.env.TMONEY_API_SECRET}`
    //           ).toString('base64')}`,
    //           'Content-Type': 'application/x-www-form-urlencoded',
    //         },
    //         body: 'grant_type=client_credentials',
    //       }
    //     );
    //     const { access_token } = await tokenResponse.json();
    //
    //     // 2. Initier le paiement
    //     const paymentResponse = await fetch(
    //       `${process.env.TMONEY_ENDPOINT}/payment`,
    //       {
    //         method: 'POST',
    //         headers: {
    //           'Authorization': `Bearer ${access_token}`,
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //           merchant_key: process.env.TMONEY_MERCHANT_ID,
    //           currency: 'XOF',
    //           order_id: request.reference,
    //           amount: Math.round(request.montant),
    //           reference: request.reference,
    //           phone: request.telephone,
    //         }),
    //       }
    //     );
    //
    //     const data = await paymentResponse.json();
    //
    //     return {
    //       success: true,
    //       transactionId: data.transaction_id,
    //       reference: request.reference,
    //       message: 'Paiement Tmoney initié',
    //       isSimulated: false,
    //       raw: data,
    //     };
    //   } catch (error: any) {
    //     return {
    //       success: false,
    //       message: error.message || 'Erreur Tmoney',
    //       isSimulated: false,
    //     };
    //   }
    // }
    // ============================================

    // ⚠️ SIMULATION (à retirer quand l'API est intégrée)
    console.log('💳 [SIMULATION TMONEY]', {
      montant: request.montant,
      telephone: request.telephone,
      reference: request.reference,
    });

    // Simuler un délai
    await new Promise((r) => setTimeout(r, 1500));

    // Simuler un succès (95% de chance)
    const isSuccess = Math.random() > 0.05;

    if (!isSuccess) {
      return {
        success: false,
        message: 'Paiement Tmoney échoué (simulation)',
        isSimulated: true,
      };
    }

    return {
      success: true,
      transactionId: `SIM-TM-${Date.now()}`,
      reference: request.reference,
      message: 'Paiement Tmoney simulé avec succès',
      isSimulated: true,
    };
  }

  // ============================================
  // FLOOZ (Moov Money)
  // ============================================
  async payerFlooz(request: PaiementRequest): Promise<PaiementResponse> {
    // ============================================
    // 🚀 INTÉGRATION RÉELLE (à décommenter plus tard)
    // ============================================
    // if (this.isProduction) {
    //   try {
    //     const response = await fetch(
    //       `${process.env.FLOOZ_ENDPOINT}/payment`,
    //       {
    //         method: 'POST',
    //         headers: {
    //           'Authorization': `Bearer ${process.env.FLOOZ_API_KEY}`,
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //           amount: Math.round(request.montant),
    //           phone: request.telephone,
    //           reference: request.reference,
    //         }),
    //       }
    //     );
    //
    //     const data = await response.json();
    //
    //     return {
    //       success: true,
    //       transactionId: data.transaction_id,
    //       reference: request.reference,
    //       message: 'Paiement Flooz initié',
    //       isSimulated: false,
    //       raw: data,
    //     };
    //   } catch (error: any) {
    //     return {
    //       success: false,
    //       message: error.message || 'Erreur Flooz',
    //       isSimulated: false,
    //     };
    //   }
    // }
    // ============================================

    // ⚠️ SIMULATION (à retirer quand l'API est intégrée)
    console.log('💳 [SIMULATION FLOOZ]', {
      montant: request.montant,
      telephone: request.telephone,
      reference: request.reference,
    });

    await new Promise((r) => setTimeout(r, 1500));

    const isSuccess = Math.random() > 0.05;

    if (!isSuccess) {
      return {
        success: false,
        message: 'Paiement Flooz échoué (simulation)',
        isSimulated: true,
      };
    }

    return {
      success: true,
      transactionId: `SIM-FL-${Date.now()}`,
      reference: request.reference,
      message: 'Paiement Flooz simulé avec succès',
      isSimulated: true,
    };
  }

  // ============================================
  // MÉTHODE PRINCIPALE
  // ============================================
  async payer(
    methode: MethodePaiement,
    request: PaiementRequest
  ): Promise<PaiementResponse> {
    switch (methode) {
      case 'TMONEY':
        return this.payerTmoney(request);
      case 'FLOOZ':
        return this.payerFlooz(request);
      default:
        return {
          success: false,
          message: 'Méthode de paiement non supportée',
          isSimulated: true,
        };
    }
  }

  // Vérifier si on est en mode simulation
  isSimulationMode(): boolean {
    return !this.isProduction || !process.env.TMONEY_API_KEY;
  }
}

export const paiementService = new PaiementService();