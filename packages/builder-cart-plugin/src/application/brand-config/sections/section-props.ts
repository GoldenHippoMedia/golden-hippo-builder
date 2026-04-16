import BuilderApi from '../../../services/builder-api';

export interface SectionProps {
  data: Record<string, any>;
  onChange: (section: string, key: string, value: any) => void;
  onChangeRoot: (key: string, value: any) => void;
  markDirty: () => void;
  api: BuilderApi;
}
