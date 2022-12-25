import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "test@mail.com",
      password: "abc@123",
    };

    await createUserUseCase.execute(user);

    const userCreated = await usersRepositoryInMemory.findByEmail(user.email);

    expect(userCreated).toHaveProperty("id");
    expect(userCreated).toHaveProperty("name", user.name);
  });

  it("Should not be able to create more than one user with the same email", async () => {
    const user: ICreateUserDTO = {
      name: "User1",
      email: "test@mail.com",
      password: "abc@123",
    };

    await createUserUseCase.execute(user);

    await expect(
      createUserUseCase.execute({
        name: "User2",
        email: "test@mail.com",
        password: "abc@123",
      })
    ).rejects.toEqual(new CreateUserError());
  });
});
