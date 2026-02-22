export interface User {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: Date;
}

export interface Post {
  id: number;
  author_id: number;
  content: string;
  image_url: string | null;
  created_at: Date;
}

export interface Like {
  id: number;
  user_id: number;
  post_id: number;
  created_at: Date;
}

export interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at: Date;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  read_at: Date | null;
  created_at: Date;
}

export interface Follow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: Date;
}

export interface PostWithAuthor {
  id: number;
  author_id: number;
  content: string;
  image_url: string | null;
  created_at: Date;
  author_username: string;
  author_display_name: string;
  author_avatar_url: string;
  like_count: number;
  comment_count: number;
  user_has_liked: boolean;
}
