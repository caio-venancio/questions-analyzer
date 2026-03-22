export interface Area {
    title: string;
    description?: string;
    examination?: string[];
}

export interface Subject {
    title: string;
    area?: string[];
    description?: string;
    examination?: string[];
}

export interface Activity {
    title: string;
    subject?: string[];
    area?: string[];
    description?: string;
}

export interface Topic {
    title: string;
    subject?: string[];
    area?: string[];
    description?: string;
}

export interface Examination {
    title: string;
    codigo?: string;
}