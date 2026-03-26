export interface SendMessageDto {
  senderUsername: string;
  receiverUsername: string;
  text?: string;
  attachmentUrl?: string;
  attachmentType?: string;
} 