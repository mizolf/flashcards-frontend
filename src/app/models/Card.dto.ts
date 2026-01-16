export interface CreateCardRequest {
  question: string;
  answer: string;
  tag?: string;
  difficulty?: number;
}

export interface CardResponse {
  id: number;
  question: string;
  answer: string;
  tag?: string;
  difficulty?: number;
}
