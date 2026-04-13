export interface SendMessageDto {
  senderUsername: string;

  // 1–1 chat
  receiverUsername?: string;

  // group chat
  roomId?: number;

  text?: string;
  attachmentUrl?: string;
  attachmentType?: string;
} 