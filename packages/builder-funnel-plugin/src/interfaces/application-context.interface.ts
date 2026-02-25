import { BuilderContent, BuilderElement, Component } from '@builder.io/sdk';
import { ApplicationContext, BuilderUser, Model } from '@builder.io/app-context';

type Content = BuilderContent | ContentModel;

interface ContentModel extends BuilderContent {
  data: Map<string, any>;
  url?: string;
  allBlocks?: BuilderElement[];
}

interface HttpCacheValue<ValueType = any> {
  loading: boolean;
  value?: ValueType;
  error?: any;
}

interface BuilderOrg {
  collectionName: string;
  initialized: boolean;
  loading: boolean;
  autoSave: boolean;
  autoUpdate: boolean;
  patchUpdates: boolean;
  hasDocument: boolean;
  value: {
    id: string;
    createdDate: number;
    name: string;
    roles: {
      id: string;
      name: string;
      description: string;
      options: { [key: string]: boolean };
      models: string;
      projects: string;
    }[];
    loadPlugins: string[];
    parentOrganization: string;
    settings: {
      plugins: {
        toJSON: () => Record<string, any>;
      };
    };
    siteUrl: string;
    subscription: string;
    type: string;
    kind: string;
  };
}

export interface ExtendedApplicationContext extends ApplicationContext {
  createContent(modelName: string, data: Partial<BuilderContent>): Promise<BuilderContent>;
  user: {
    id: string;
    displayName: string;
    email: string;
    photoURL: string;
    uid: string;
    emailVerified: boolean;
    getUser(id: string): Promise<BuilderUser | null>;
    listUsers(): Promise<BuilderUser[]>;
    authHeaders: { [key: string]: string };
    apiKey: string;
    can(permissionType: 'editCode' | 'admin' | 'editDesigns' | 'createContent'): boolean;
    signOut(): void;
    organizations: BuilderOrg[];
    currentOrganization: string;
    data: {
      displayName: string;
      email: string;
      phoneNumber: null;
      photoURL: string | null;
      uid: string;
      emailVerified: boolean;
    };
    settings: {
      signupDate: number;
      organizations: string[];
      roles: Record<string, string>;
      jobFunctions?: string[];
      techStack: string[];
      name: string;
      authProvider: string;
      lastActiveTime: number;
      hasCompletedOnboarding: boolean;
      experiments: Record<string, boolean>;
    };
  };
  httpCache: {
    get<ResponseType = any>(url: string, options?: RequestInit): HttpCacheValue<ResponseType>;
  };
  dialogs: {
    prompt(options: {
      title?: string;
      text?: string;
      confirmText?: string;
      cancelText?: string;
      placeholderText?: string;
      defaultValue?: string;
    }): Promise<string>;
    alert(text: string, title?: string): Promise<null>;
  };
  models: {
    result: Model[];
    update(model: Model): Promise<void>;
    remove(model: Model): Promise<void>;
  };
  content: {
    update(content: Content): Promise<void>;
    remove(content: Content): Promise<void>;
  };
  designerState: {
    editingContentModel: ContentModel | null;
    draggingInItem: BuilderElement | Component | string | null;
    undo(): Promise<void>;
    redo(): Promise<void>;
    canUndo: boolean;
    canRedo: boolean;
    xrayMode: boolean;
    editingIframeRef: null | HTMLIFrameElement;
    artboardSize: {
      width: number;
    };
  };
  builderComponents: Component[];
  contentEditorPage: {
    fullScreenIframe: boolean;
    contentEditingMode: boolean;
  };
  globalState: {
    showGlobalBlockingLoading(message?: string): void;
    hideGlobalBlockingLoading(): void;
    openDialog(element: JSX.Element): Promise<() => void>;
  };
  location: {
    go(relativeUrl: string): void;
    pathname: string;
  };
  config: {
    darkMode: boolean;
  };
}
