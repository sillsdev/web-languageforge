export type TranslateMetricsType = 'edit' | 'navigate';

export interface TranslateMetrics {
  id: string;
  type: TranslateMetricsType;
  sessionId: string;
  textRef: string;
  chapter: number;

  // navigation metrics
  keyNavigationCount?: number;
  mouseClickCount?: number;

  // editing metrics
  keyBackspaceCount?: number;
  keyDeleteCount?: number;
  keyCharacterCount?: number;
  productiveCharacterCount?: number;
  suggestionAcceptedCount?: number;
  suggestionTotalCount?: number;
  timeEditActive?: number;
}
