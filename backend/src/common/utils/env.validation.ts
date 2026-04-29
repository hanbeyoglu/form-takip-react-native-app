import { IsNotEmpty, IsString, validateSync } from "class-validator";

export class EnvSchema {
  @IsString()
  @IsNotEmpty()
  NODE_ENV!: string;

  @IsString()
  @IsNotEmpty()
  PORT!: string;

  @IsString()
  @IsNotEmpty()
  MONGO_URI!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN!: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_PROJECT_ID!: string;

  @IsString()
  @IsNotEmpty()
  FIREBASE_WEB_API_KEY!: string;
}

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const schema = Object.assign(new EnvSchema(), config);
  const errors = validateSync(schema, {
    skipMissingProperties: false
  });

  if (errors.length > 0) {
    const message = errors
      .map((error: { property: string }) => error.property)
      .join(", ");
    throw new Error(`Invalid environment variables: ${message}`);
  }

  return config;
}
