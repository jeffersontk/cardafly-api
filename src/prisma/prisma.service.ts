import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    // Fallback universal: não depende de typings do $on
    process.on('beforeExit', async () => {
      try {
        await this.$disconnect();
      } catch {}
    });
  }

  // Se quiser manter a API do Nest:
  async enableShutdownHooks(app: INestApplication) {
    // Tipagem do $on varia entre versões; evite o erro de 'never':
    (this as unknown as { $on: (e: string, cb: () => Promise<void>) => void }).$on(
      'beforeExit',
      async () => {
        await app.close();
      },
    );
  }
}
