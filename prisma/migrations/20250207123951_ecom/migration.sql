-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "p_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);
