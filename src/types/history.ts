export interface AdHistory {
  id: string;
  ad_id: string | null;
  action_type: 'added' | 'updated' | 'deleted';
  ad_title: string;
  ad_description: string;
  ad_image: string;
  clicks: number;
  created_at: string;
}