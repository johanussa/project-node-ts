import { Request, Response } from 'express';
import { Comparative, ResponseSalary, Salary } from '../types';
import salariesData from './salaries.json';

const salaries: Salary = salariesData as Salary;

export const getAllData = (_req: Request, res: Response): void => {
    console.log("@getAllData SERV > Se obtienen todos los salarios");
    res.json(salaries);
}

export const socialClassReference = (req: Request, res: Response): void => {
    try {
        const salary = Number(req.params.salary);

        if (isNaN(salary) || salary <= 0) {
            res.status(400).json({ error: "El valor de salario debe ser un número positivo" });
        }

        const daylySalary: number = parseFloat((salary / 30).toFixed(2));
        console.log("@socialClassReference SERV > Salario recibido: ", salary);

        const socialClass = salaries.clases_sociales.find((clase) => {
            return salary >= clase.min && (clase.max === null || salary <= clase.max);
        });

        if (!socialClass) {
            console.log("@socialClassReference SERV > No se encontro la clase social");
            res.status(404).json({ error: "No se encontró la clase social" });
            return;
        }

        const response: ResponseSalary = {
            class: { ...socialClass, salarioDiario: daylySalary },
            references: salaries.salarios_referencia,
            comparative: getReferenceSalaries(salary)
        }

        res.json(response);
    } catch (error) {
        console.error("@socialClassReference SERV > Error al obtener la clase social: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getReferenceSalaries = (salary: number): Comparative[] | [] => {

    const { salarios_referencia, metadata } = salaries;
    const dailyMinimumWage = metadata.salario_minimo_mensual / 30;

    return salarios_referencia.map(({ nombre, salario_diario, tipo }) => ({
        nombre,
        salario_diario,
        veces_salario_minimo: +(salario_diario / dailyMinimumWage).toFixed(2),
        veces_salario_usuario: +(salario_diario / salary).toFixed(2),
        tipo,
    }));
}