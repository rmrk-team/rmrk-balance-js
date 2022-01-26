import * as $RMRK from "../";

async function main() {
  const address = "...";

  $RMRK.provideDefaults();

  const [moonbalance, karurabalance] = await Promise.all([
    $RMRK.moonriver.balance(address),
    $RMRK.karura.balance(address),
  ]);

  const total = $RMRK.concat(moonbalance, karurabalance);

  console.log($RMRK.format(total));
}

main();
