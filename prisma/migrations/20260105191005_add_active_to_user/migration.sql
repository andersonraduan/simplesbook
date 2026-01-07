-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telemovel` VARCHAR(191) NOT NULL,
    `dataNascimento` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Cliente_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Servico` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `time_execution` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Servico_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Agendamento` (
    `id` VARCHAR(191) NOT NULL,
    `clienteId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `dataHoraInicio` DATETIME(3) NOT NULL,
    `dataHoraFim` DATETIME(3) NOT NULL,
    `valorTotal` DECIMAL(10, 2) NOT NULL,
    `duracaoTotal` INTEGER NOT NULL,
    `status` ENUM('PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
    `observacoes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Agendamento_userId_idx`(`userId`),
    INDEX `Agendamento_clienteId_idx`(`clienteId`),
    INDEX `Agendamento_dataHoraInicio_idx`(`dataHoraInicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgendamentoServico` (
    `id` VARCHAR(191) NOT NULL,
    `agendamentoId` VARCHAR(191) NOT NULL,
    `servicoId` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `timeExecution` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AgendamentoServico_agendamentoId_idx`(`agendamentoId`),
    INDEX `AgendamentoServico_servicoId_idx`(`servicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('CONFIRMACAO', 'LEMBRETE', 'DIA_DO_AGENDAMENTO', 'CANCELAMENTO', 'MUDANCA_STATUS') NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `intervaloMinutos` INTEGER NULL,
    `mensagemSMS` TEXT NULL,
    `mensagemWhatsApp` TEXT NULL,
    `habilitarSMS` BOOLEAN NOT NULL DEFAULT false,
    `habilitarWhatsApp` BOOLEAN NOT NULL DEFAULT false,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NotificationTemplate_userId_idx`(`userId`),
    INDEX `NotificationTemplate_tipo_idx`(`tipo`),
    UNIQUE INDEX `NotificationTemplate_userId_tipo_intervaloMinutos_key`(`userId`, `tipo`, `intervaloMinutos`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationScheduled` (
    `id` VARCHAR(191) NOT NULL,
    `agendamentoId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `canal` ENUM('SMS', 'WHATSAPP') NOT NULL,
    `destinatario` VARCHAR(191) NOT NULL,
    `mensagem` TEXT NOT NULL,
    `dataHoraAgendada` DATETIME(3) NOT NULL,
    `status` ENUM('PENDENTE', 'ENVIADA', 'FALHA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    `tentativas` INTEGER NOT NULL DEFAULT 0,
    `ultimaTentativa` DATETIME(3) NULL,
    `erroMensagem` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NotificationScheduled_agendamentoId_idx`(`agendamentoId`),
    INDEX `NotificationScheduled_templateId_idx`(`templateId`),
    INDEX `NotificationScheduled_status_idx`(`status`),
    INDEX `NotificationScheduled_dataHoraAgendada_idx`(`dataHoraAgendada`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationLog` (
    `id` VARCHAR(191) NOT NULL,
    `agendamentoId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('CONFIRMACAO', 'LEMBRETE', 'DIA_DO_AGENDAMENTO', 'CANCELAMENTO', 'MUDANCA_STATUS') NOT NULL,
    `canal` ENUM('SMS', 'WHATSAPP') NOT NULL,
    `destinatario` VARCHAR(191) NOT NULL,
    `mensagem` TEXT NOT NULL,
    `status` ENUM('PENDENTE', 'ENVIADA', 'FALHA', 'CANCELADA') NOT NULL,
    `twilioSid` VARCHAR(191) NULL,
    `erroMensagem` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `NotificationLog_agendamentoId_idx`(`agendamentoId`),
    INDEX `NotificationLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPreferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `calendarioView` ENUM('DIA', 'TRES_DIAS', 'SEMANA', 'MES') NOT NULL DEFAULT 'SEMANA',
    `horarioInicioAtendimento` VARCHAR(191) NOT NULL DEFAULT '08:00',
    `horarioFimAtendimento` VARCHAR(191) NOT NULL DEFAULT '20:00',
    `intervaloSlot` INTEGER NOT NULL DEFAULT 30,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserPreferences_userId_key`(`userId`),
    INDEX `UserPreferences_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemSettings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SystemSettings_key_key`(`key`),
    INDEX `SystemSettings_key_idx`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Servico` ADD CONSTRAINT `Servico_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Agendamento` ADD CONSTRAINT `Agendamento_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Agendamento` ADD CONSTRAINT `Agendamento_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgendamentoServico` ADD CONSTRAINT `AgendamentoServico_agendamentoId_fkey` FOREIGN KEY (`agendamentoId`) REFERENCES `Agendamento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgendamentoServico` ADD CONSTRAINT `AgendamentoServico_servicoId_fkey` FOREIGN KEY (`servicoId`) REFERENCES `Servico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationTemplate` ADD CONSTRAINT `NotificationTemplate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationScheduled` ADD CONSTRAINT `NotificationScheduled_agendamentoId_fkey` FOREIGN KEY (`agendamentoId`) REFERENCES `Agendamento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationScheduled` ADD CONSTRAINT `NotificationScheduled_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `NotificationTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationLog` ADD CONSTRAINT `NotificationLog_agendamentoId_fkey` FOREIGN KEY (`agendamentoId`) REFERENCES `Agendamento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPreferences` ADD CONSTRAINT `UserPreferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
