const API_BASE = import.meta.env.VITE_API_URL || '';

export interface PlantImage {
  id: string;
  image_data: string;
  captured_at: string;
  created_at: string;
}

export interface PlantAnalysis {
  id: string;
  image_id: string;
  health_status: string;
  health_score: number;
  green_percentage: number;
  yellow_percentage: number;
  brown_percentage: number;
  harvest_ready: boolean;
  recommendations: string;
  analyzed_at: string;
  created_at: string;
}

export async function insertPlantImage(image_data: string, captured_at?: string): Promise<PlantImage> {
  const res = await fetch(`${API_BASE}/api/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_data, captured_at: captured_at || new Date().toISOString() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText || 'Failed to save image');
  }
  return res.json();
}

export async function insertPlantAnalysis(data: {
  image_id: string;
  health_status: string;
  health_score: number;
  green_percentage: number;
  yellow_percentage: number;
  brown_percentage: number;
  harvest_ready: boolean;
  recommendations: string;
  analyzed_at?: string;
}): Promise<PlantAnalysis> {
  const res = await fetch(`${API_BASE}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      analyzed_at: data.analyzed_at || new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText || 'Failed to save analysis');
  }
  return res.json();
}

export interface AnalysisWithImage extends PlantAnalysis {
  plant_images?: PlantImage;
}

export async function fetchAnalyses(limit = 50): Promise<AnalysisWithImage[]> {
  const res = await fetch(`${API_BASE}/api/analyses?limit=${limit}`);
  if (!res.ok) {
    throw new Error('Failed to fetch analyses');
  }
  return res.json();
}
