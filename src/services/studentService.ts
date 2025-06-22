
import { studentOperations } from './student/studentOperations';
import { studentQueries } from './student/studentQueries';

// Main service that exports all functionality
export class StudentService {
  // CRUD Operations
  static createStudent = studentOperations.createStudent;
  static updateStudent = studentOperations.updateStudent;
  static deleteStudent = studentOperations.deleteStudent;

  // Query Operations
  static getAllStudents = studentQueries.getAllStudents;
  static getStudentById = studentQueries.getStudentById;
}
