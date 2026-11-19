import * as employeeService from '../services/employee.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listEmployees = async (req, res, next) => {
  try {
    const { search, departmentId } = req.query;
    const data = await employeeService.getEmployees({ search, departmentId });
    return sendSuccess(res, data, 'Lấy danh sách nhân viên thành công');
  } catch (error) {
    next(error);
  }
};

export const getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await employeeService.getEmployeeById(id);
    if (!data) return sendError(res, 'Không tìm thấy nhân viên', 404);
    return sendSuccess(res, data, 'Lấy chi tiết nhân viên thành công');
  } catch (error) {
    next(error);
  }
};

export const getEmployeeAssets = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await employeeService.getEmployeeAssets(id);
    return sendSuccess(res, data, 'Lấy danh sách tài sản nhân viên thành công');
  } catch (error) {
    next(error);
  }
};

export const getEmployeeAccounts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const emp = await employeeService.getEmployeeById(id);
    if (!emp) return sendError(res, 'Không tìm thấy nhân viên', 404);
    const data = await employeeService.getEmployeeAccounts(emp.employeeCode);
    return sendSuccess(res, data, 'Lấy danh sách tài khoản hệ thống thành công');
  } catch (error) {
    next(error);
  }
};
