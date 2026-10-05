export interface MapIncident {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  category: string;
  priority: 'Alta' | 'Media' | 'Baja';
  sentiment: string;
  source: string;
  neighborhood: string;
  zone: string;
  status: string;
  reportsCount: number;
  dateTime: string;
  isNew?: boolean;
}

