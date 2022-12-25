import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { OperationType } from "./CreateStatementController";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Create statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementRepositoryInMemory
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("Should be able to make a deposit in an user account", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "test@mail.com",
      password: "abc@123",
    };

    const user_id = <string>(await createUserUseCase.execute(user)).id;

    const statement = {
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Deposit Test",
    };

    const createdStatement = await createStatementUseCase.execute(statement);

    expect(createdStatement).toHaveProperty("type", statement.type);
    expect(createdStatement).toHaveProperty("amount", statement.amount);
  });

  it("Should be able to withdraw credits from an user account", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "test@mail.com",
      password: "abc@123",
    };

    const user_id = <string>(await createUserUseCase.execute(user)).id;

    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Deposit Test",
    });

    await createStatementUseCase.execute({
      user_id,
      type: "withdraw" as OperationType,
      amount: 100,
      description: "Withdraw test",
    });

    const balance = await getBalanceUseCase.execute({ user_id });

    expect(balance).toHaveProperty("balance", 0);
  });

  it("Should not be able to make a deposit in an unexistent user account", async () => {
    expect(async () => {
      const user_id = "fake_user_id";

      await createStatementUseCase.execute({
        user_id,
        type: "deposit" as OperationType,
        amount: 100,
        description: "Deposit Test",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to withdraw credits from an unexistent user account", async () => {
    expect(async () => {
      const user_id = "fake_user_id";

      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Withdraw test",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to withdraw credits from an user account without credits", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User",
        email: "test@mail.com",
        password: "abc@123",
      };

      const user_id = <string>(await createUserUseCase.execute(user)).id;

      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Withdraw test",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
