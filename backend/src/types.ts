type Max = number | null;

export interface SocialClass {
    nombre: string;
    min: number;
    max: Max;
    color: string;
    descripcion: string;
    salarioDiario: number;
}

export interface ReferenceSalary {
    nombre: string;
    salario_diario: number;
    tipo: string;
}

export interface Metadata {
    fuentes: string;
    actualizacion: string;
    salario_minimo_mensual: number;
    tasa_cambio_usd: number;
}

export interface Salary {
    clases_sociales: SocialClass[];
    salarios_referencia: ReferenceSalary[];
    metadata: Metadata;
}

export interface Comparative extends ReferenceSalary {
    veces_salario_minimo: number;
    veces_salario_usuario: number;
}

export interface ResponseSalary {
    class: SocialClass;
    references: ReferenceSalary[];
    comparative: Comparative[];
}