export class CreateCommentDto {

  text: string;

  time?: number;

  parentId?: number;

  // OPTIONAL VIDEO
  videoId?: number;

  // OPTIONAL STORY
  storyId?: number;

}