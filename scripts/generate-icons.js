import sharp from "sharp";

async function generate() {
  const iconBuffer = await sharp("public/app-icon.svg")
    .resize(400, 400)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 239, g: 168, b: 24, alpha: 1 },
    },
  })
    .composite([{ input: iconBuffer, gravity: "centre" }])
    .png()
    .toFile("public/icons/icon-512.png");

  console.log("512px done");

  const iconBuffer2 = await sharp("public/app-icon.svg")
    .resize(150, 150)
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 239, g: 168, b: 24, alpha: 1 },
    },
  })
    .composite([{ input: iconBuffer2, gravity: "centre" }])
    .png()
    .toFile("public/icons/icon-192.png");

  console.log("192px done");
}

generate();
