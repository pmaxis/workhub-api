const mockDelegate = () => ({
  create: jest.fn(),
  createMany: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  upsert: jest.fn(),
  count: jest.fn(),
});

export class DatabaseService {
  user = mockDelegate();
  session = mockDelegate();
  role = mockDelegate();
  permission = mockDelegate();
  rolePermission = mockDelegate();
  userRole = mockDelegate();
  $connect = jest.fn();
  $disconnect = jest.fn();
}
