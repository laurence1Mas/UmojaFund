export class CardanoSimulator {
  // Générer des adresses mock
  static generateMockAddress(): string {
    const prefixes = ['addr_test1', 'addr1'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const chars = 'qwertyuiopasdfghjklzxcvbnm1234567890';
    let address = prefix;
    
    for (let i = 0; i < 58; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return address;
  }
  
  // Simuler une transaction
  static simulateTransaction(amountADA: number): {
    txHash: string;
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
  } {
    const txHash = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simuler délai de confirmation
    setTimeout(() => {
      // Auto-confirmer après 5-10 secondes
      console.log(`✅ Transaction ${txHash} confirmée (simulée)`);
    }, 5000 + Math.random() * 5000);
    
    return {
      txHash,
      status: 'pending',
      confirmations: 0
    };
  }
  
  // Générer QR Code mock
  static generateQRCode(amountADA: number, projectId: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=cardano:${projectId}:${amountADA}:${Date.now()}`;
  }
  
  // Simuler webhook Cardano
  static simulateWebhook(projectId: string, amountADA: number): void {
    // Simuler une confirmation après délai
    setTimeout(async () => {
      try {
        const mockTx = {
          txHash: `webhook_tx_${Date.now()}`,
          amountADA,
          status: 'confirmed',
          confirmations: 3,
          metadata: { projectId, simulated: true }
        };
        
        // Appeler ton endpoint webhook
        await fetch('http://localhost:3000/api/webhooks/cardano/tx-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockTx)
        });
        
        console.log(`📨 Webhook simulé envoyé pour ${projectId}`);
      } catch (error) {
        console.error('Erreur webhook simulé:', error);
      }
    }, 3000);
  }
}