export class CreateCommentDto {
  videoId: number;
  text: string;
  time: number;
  parentId?: number;
}