# Peers

一个区块链网络是由一组 peer 节点组成（或者简称 peer）。peers 是区块链网络的基础元素，因为它们保存着分类账(ledger)和智能合约(smart contracts)

一个 分类账 ledger 不可变的记录着所有由智能合约(或者 chaincode)产生的交易 transaction

## A word on terminology

Hyperledger Fabric 通过 chaincode 实现智能合约，chaincode 是一段可以访问 ledger 的代码，chaincode 和 smart contracts 是同一个东西。

## Ledgers and Chaincode

Peer 保存着分类账 ledger 和 chaincode。更准确的说，peer 保存着 ledger 和 chaincode 的多个实例。这给 Fabric 网络提供了冗余，避免单点故障。

![](https://ws1.sinaimg.cn/large/006tKfTcly1fsasdwgc7hj30m609va9z.jpg)

上图中，Peer 保存 ledger L1 的一个实例和 chaincode S1 的一个实例。Peer 可以保存多个 ledger 和 chaincode 的实例。

由于 Peer 是 ledgers 和 chaincodes 的宿主，因此，应用程序和管理员想要访问 ledgers 和 chaincodes 这些资源，必须要与 Peer 交互。这就是为什么说 Peer 是 Hyperledger Fabric 网络的基础。

当一个 Peer 被创建时，它没有任何 ledger 和 chaincode。稍后我们会看到怎么在 Peer 上创建 ledger，安装 chaincode。

## Multiple Ledgers

 一个 Peer 可以保存不止一个 ledger，这对于弹性系统的设计很有帮助。

![](https://ws1.sinaimg.cn/large/006tKfTcly1fsasokt1fsj30m409wweh.jpg)

Peer 可以保存多个 ledger，每一个 ledger 都有 0 到多个 chaincode 作用在它上面。上图中，可以看到，peer P1 保存 ledger L1 和 L2。
ledger L1 可以使用 chaincode S1 访问。ledger L2 可以使用 chaincode S1 和 S2 访问。

一个 Peer 保存一个 ledger 实例，但是不保存任何用于访问该 ledger 的 chaincode，这是可能的，但很少将 Peer 配置成这种方式。

绝大多数 Peer 至少会安装一个 chaincode，可以查询或更新该 Peer 上的 ledger 实例。值得一提的是，无论用户是否安装给外部应用程序使用的 chaincode，peer 上始终存在 system chaincodes。

## Multiple Chaincodes

peer 所拥有的 ledger 数量与可以访问该 ledger 的 chaincode 的数量之间没有固定的关系。

![](https://ws1.sinaimg.cn/large/006tKfTcly1fsat35zwdrj30m509v74c.jpg)

上图中，一个 peer 保存了多个 chaincode。每个 ledger 可以有多个可以访问它的 chaincode。我们看到，peer P1 保存了 ledger L1 和 L2，L1 可以使用 chaincode S1 和 S2 访问，L2 可以使用 chaincode S1 和 S3 访问。
S1 可以同时访问 L1 和 L2。

稍后我们会看到，为什么 Hyperledger Fabric 中的 channel 概念很重要，当保存多个 ledger 和 chaincode 在一个 peer 上。

## Applications and Peers

现在我们演示应用程序如何于 peer 交互，以访问 ledger。ledger 查询交互涉及应用程序和 peer 之间的简单三步对话;ledger 更新交互还需要额外的两步。最重要的是要理解的是 ledger 查询的应用程序和 peer 交互与 ledger 更新 transaction 风格的差异。

当应用程序要访问 ledger 和 chaincode 时，需要连接到 peer。Hyperledger Fabric Software Development Kit (SDK)让这些操作变得简单。它提供的 APIs 可以使应用程序连接到 peer，调用 chaincode 生成 transction，提交 transaction 到网络，该网络订购并提交给 ledger，并在此过程完成时接收事件。

通过连接到 peer，应用程序可以执行 chaincode，去查询和更新 ledger。ledger 查询 transaction 的结果将立即返回，而 ledger 更新涉及应用程序，orderer 和 peer 的复杂交互。让我们更详细地调查一下。

![](https://ws4.sinaimg.cn/large/006tKfTcly1fsatl17ovyj30ng0aa74y.jpg)

peer 与 orderer 一起，确保 ledger 在每个 peer 上都保持最新。上图中，应用程序 A 连接到 P1 并调用 chaincode S1 去查询和更新 ledger L1。P1 调用 S1 来生成包含查询结果或建议 ledger 更新的提案响应。应用程序 A 接收这个提案响应，对于查询操作，到这里就完成了。对于更新操作，A 根据所有响应构建一个 transaction，并将它发送给 O1 进行排序。O1 将整个网络中的 transaction 收集到 block 中，并将这些 transaction 分发给所有 peer，包括 P1。 P1 在申请 L1 之前验证 transaction。一旦 L1 被更新，P1 产生一个由 A 接收的事件来表示完成。

peer 可以立即将查询结果返回给应用程序，如果满足查询所需的所有信息均位于 peer 的本地 ledger 副本中。为了响应来自应用程序的查询，peer 不会咨询其他 peer。但是，应用程序可以连接到一个或多个 peer 来发出查询;例如，证实多个 peer 之间的结果，或者如果怀疑信息可能过期，则从不同的 peer 中检索更新的结果。

一个更新 transaction 与查询 transaction 相同的方式启动，但有两个额外的步骤。虽然 ledger 更新应用程序也连接到 peer 以调用 chaincode，但与 ledger 查询应用程序不同，单个 peer 目前无法执行 ledger 更新，因为其他 peer 必须首先同意这种变化 - 一个称为共识的过程。因此，peer 向应用程序返回提议的更新 - 这个 peer 将适用于其他 peer 事先同意的情况。

## Peers and Channels

https://hyperledger-fabric.readthedocs.io/en/latest/peers/peers.html#
