// send-message.dto.ts

export interface SendMessageDto {
  receiverUsername: string; // ✅ REQUIRED now
  text?: string;
  attachmentUrl?: string;
  attachmentType?: string;
}