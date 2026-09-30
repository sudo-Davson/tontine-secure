// app/api/cotisations/payer/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, verifySession, COOKIE_NAME } from '@/lib/auth';
import { paiementService, MethodePaiement } from '@/lib/services/paiement-service';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const session = await verifySession(token);
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: payload.userId } });
}

// ============================================
// POST /api/cotisations/payer
// ============================================
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cotisationId, methode, telephone } = body;

    // Validation
    if (!cotisationId || !methode || !telephone) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }

    // 1. Récupérer la cotisation
    const cotisation = await prisma.cotisation.findUnique({
      where: { id: cotisationId },
      include: {
        tontine: true,
        user: true,
      },
    });

    if (!cotisation) {
      return NextResponse.json(
        { success: false, error: 'Cotisation non trouvée' },
        { status: 404 }
      );
    }

    // 2. Vérifier que c'est bien la cotisation de l'utilisateur
    if (cotisation.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Cette cotisation ne vous appartient pas' },
        { status: 403 }
      );
    }

    // 3. Vérifier que la cotisation n'est pas déjà payée
    if (cotisation.statut === 'PAYEE') {
      return NextResponse.json(
        { success: false, error: 'Cette cotisation est déjà payée' },
        { status: 400 }
      );
    }

    // 4. Générer une référence unique
    const reference = `COT-${cotisation.id.substring(0, 8)}-${Date.now()}`;

    // 5. Appeler le service de paiement (simulé pour l'instant)
    const paiementResult = await paiementService.payer(
      methode as MethodePaiement,
      {
        montant: cotisation.montant,
        telephone,
        reference,
        description: `Cotisation tontine "${cotisation.tontine.nom}"`,
      }
    );

    // 6. Si le paiement échoue
    if (!paiementResult.success) {
      // Créer une transaction échouée
      await prisma.paiement.create({
        data: {
          userId: user.id,
          tontineId: cotisation.tontineId,
          montant: cotisation.montant,
          type: 'COTISATION',
          statut: 'ECHOUE',
          methode,
          reference,
          telephone,
          description: paiementResult.message,
          metadata: JSON.stringify(paiementResult.raw || {}),
        },
      });

      return NextResponse.json(
        { success: false, error: paiementResult.message },
        { status: 400 }
      );
    }

    // 7. Mettre à jour la cotisation
    const updatedCotisation = await prisma.cotisation.update({
      where: { id: cotisationId },
      data: {
        statut: 'PAYEE',
        datePaiement: new Date(),
        methodePaiement: methode,
        reference: paiementResult.reference,
      },
    });

    // 8. Créer la transaction
    const paiement = await prisma.paiement.create({
      data: {
        userId: user.id,
        tontineId: cotisation.tontineId,
        montant: cotisation.montant,
        type: 'COTISATION',
        statut: 'REUSSI',
        methode,
        reference: paiementResult.reference || reference,
        telephone,
        description: `Cotisation payée pour "${cotisation.tontine.nom}"`,
        metadata: JSON.stringify({
          transactionId: paiementResult.transactionId,
          isSimulated: paiementResult.isSimulated,
        }),
      },
    });

    // 9. Mettre à jour le montant collecté de la tontine
    await prisma.tontine.update({
      where: { id: cotisation.tontineId },
      data: {
        montantCollecte: {
          increment: cotisation.montant,
        },
      },
    });

    // 10. Créer une notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        titre: 'Cotisation payée',
        message: `Votre cotisation de ${cotisation.montant.toLocaleString()} FCFA pour "${cotisation.tontine.nom}" a été payée avec succès.\n\n` +
          `📱 Méthode : ${methode === 'TMONEY' ? 'Tmoney' : 'Flooz'}\n` +
          `🔖 Référence : ${paiementResult.reference}`,
        type: 'INFO',
        lien: `/tontines/${cotisation.tontineId}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: paiementResult.isSimulated
        ? 'Paiement simulé avec succès (les vraies APIs seront intégrées plus tard)'
        : 'Paiement effectué avec succès',
      cotisation: updatedCotisation,
      paiement,
      isSimulated: paiementResult.isSimulated,
      transactionId: paiementResult.transactionId,
    });
  } catch (error: any) {
    console.error('Erreur paiement cotisation :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}