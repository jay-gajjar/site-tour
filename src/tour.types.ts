export interface Step {
  selector: string;
  title: string;
  content: string;
}

export interface TourOption {
  steps: Step[];
  padding: number;
  disableClose: boolean;
}
