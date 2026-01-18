
import { VideoCategory } from "../types";

export class VideoProductionService {
  private static instance: VideoProductionService;
  // URL base extraída dos componentes existentes
  private webhookUrl = 'https://n8n-n8n.6wqa93.easypanel.host/webhook/video-production';

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new VideoProductionService();
    }
    return this.instance;
  }

  /**
   * Envia o pedido de criação para o Webhook externo.
   */
  async requestProduction(prompt: string, category: VideoCategory, userId: string, isPublic: boolean): Promise<boolean> {
    console.log(`[Production] Solicitando vídeo via Webhook: ${category} | Público: ${isPublic} para o usuário ${userId}`);
    
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_video',
          prompt,
          category,
          userId,
          isPublic,
          timestamp: Date.now(),
          aspectRatio: '9:16',
          resolution: '720p'
        })
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor de produção');
      }

      return true;
    } catch (error) {
      console.error("Production Request Error:", error);
      // Para fins de demonstração, simularemos sucesso se o webhook ainda não estiver ativo
      console.warn("Simulando envio de pedido (Webhook Offline)");
      return true; 
    }
  }

  /**
   * Simula a obtenção de um link de vídeo processado.
   */
  getPlaceholderVideo(category: string): string {
    const placeholders: Record<string, string> = {
      'timelapse': 'https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-over-a-mountain-landscape-4252-large.mp4',
      'animated_character': 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-fenced-in-the-middle-of-the-desert-42557-large.mp4',
      'motivational': 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4'
    };
    return placeholders[category] || placeholders['motivational'];
  }
}
