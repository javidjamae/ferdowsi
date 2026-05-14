export interface Signal {
  title: string;
  raw_query?: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface SignalSource {
  name: string;
  enabled: boolean;
  fetch(): Promise<Signal[]>;
}
