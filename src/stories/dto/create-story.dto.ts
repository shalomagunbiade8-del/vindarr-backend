export class CreateStoryDto {
  title: string;
  content: string;
  imageUrl?: string;
  avatar?: string; // ✅ ADD THIS
}