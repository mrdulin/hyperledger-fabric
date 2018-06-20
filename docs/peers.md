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

## Peers and Identity

网络中的每个 peer 均由其拥有的组织的管理员分配一个数字证书。

![](https://ws2.sinaimg.cn/large/006tNc79gy1fsbn2ceoqbj31kw0xnjwf.jpg)

当一个 peer 连接到一个 channel,其数字证书通过 MSP 渠道识别其所属组织。在这个例子中，P1 和 P2 具有由 CA1 发布的身份。Channel C 根据其通道配置中的策略确定来自 CA1 的身份应使用 ORG1.MSP 与 Org1 相关联。同样，P3 和 P4 被 ORG2.MSP 识别为 Org2 的一部分。

只要 peer 使用 channel 连接区块链网络，channel 配置中的策略就会使用 peer 的身份来确定其权限。身份到组织的映射由称为会员服务提供商（MSP）的组件提供，它确定如何将 peer 分配给特定组织中的特定角色，并据此获得对区块链资源的适当访问权限。而且，peer 只能由一个单独的组织拥有，因此与单个 MSP 相关联。将 MSP 视为在区块链网络中提供个人身份与特定组织角色之间的联系。

peer 以及与区块链网络交互的所有内容都通过其数字证书和 MSP 获取其组织身份。如果他们想要与区块链网络进行交互，则 peer，应用程序，最终用户，管理员和订 orderer 必须拥有身份和关联的 MSP。我们给每个使用身份（主体）与区块链网络进行交互的实体命名。

最后，请注意，peer 位于实际位置并不重要 - 它可以驻留在云中，也可以位于其中一个组织拥有的数据中心中，也可以位于本地计算机上 - 与其相关的身份标识为由特定组织拥有。在我们上面的示例中，P3 可以托管在 Org1 的数据中心中，但只要与其相关的数字证书由 CA2 发布，那么它就由 Org2 拥有。

## Peers and Orderers

我们已经看到，peer 构成了区块链网络的基础，保存 ledger 和 chaincode 可以通过与 peer 连接的应用程序查询和更新。然而，应用程序和 peer 彼此交互以确保每个 peer 的 ledger 保持一致的机制是由称为 orderers 的特殊节点调解的。

更新 transaction 与查询 transaction 完全不同，因为单个 peer 本身不能更新 ledger - 更新需要网络中其他 peer 的同意。peer 需要网络中的其他 peer 批准 ledger 更新，然后才能将其应用于 peer 的本地 ledger。这个过程被称为共识，这比完成简单的查询要花费更长的时间。但是当批准交易的所有 peer 都这样做，并且交易承诺到 ledger 时，peer 将通知他们的连接应用程序分类帐已更新。

具体而言，需要更新 ledger 的应用程序涉及 3 阶段流程，这可确保区块链网络中的所有 peer 保持其 ledger 彼此一致。在第一阶段，应用程序与批准 peer 的一个子集一起工作，每个 peer 都提供了对应用程序的建议 ledger 更新的认可，但不会将提议的更新应用于其 ledger 副本。在第二阶段，这些单独的认可被作为 transaction 收集在一起并打包成块。在最后阶段，将这些块分发回每个 peer，每个 peer 在应用到该 peer 的 ledger 副本之前对每个交易进行验证。

### Phase 1: Proposal

交易工作流程的第一阶段涉及应用程序和一组 peer 之间的交互 ​​- 它不涉及 orderer。阶段 1 只涉及一个应用程序，要求不同组织同意所提议的 chaincode 调用的结果。

为了开始第一阶段，应用程序生成一个 transaction proposal，并将其发送给每个需要的 peer 进行认可。这些认可的 peer 中的每一个然后独立地使用 transaction proposal 来执行 chaincode 以生成 transaction proposal response。它不会将此更新应用于 ledger，而只是简单地签署并将其返回给应用程序。一旦应用程序收到足够数量的已签名 proposal response，交易流程的第一阶段即告完成。我们来仔细研究一下这个阶段。

![](https://ws4.sinaimg.cn/large/006tNc79gy1fsboi317s2j31kw0l4777.jpg)

transaction proposal 由返回认可 proposal response 的 peer 独立执行。在这个例子中，应用程序 A1 生成 transaction T1 建议 P，它在 channel C 上发送给 peer P1 和 peer P2 两者。P1 使用 transaction T1 proposal P 执行 S1，生成 transaction T1 响应 R1，它与 E1 一致。相应地，P2 使用 transaction T1 proposal P 执行 S1，生成它与 E2 一致的 transaction T1 响应 R2。应用程序 A1 收到两笔 transaction T1 的认可 responses，即 E1 和 E2。

最初，应用程序选择一组 peer 来生成一组 proposal 的 ledger 更新。应用程序选择了哪些 peer？这取决于背书政策（为 chaincode 定义），该政策定义了需要认可 proposal 的 ledger 更改才能被网络接受的一组组织。这实际上意味着达成共识 - 每个重要的组织都必须认可 proposal 的 ledger 更改，然后才能将其接受到任何 peer 的 ledger 中。

peer 通过添加其数字签名来支持 proposal response，并使用其私钥对整个有效负载进行签名。这种认可可以随后用于证明这个组织的 peer 产生了特定的回应。在我们的例子中，如果 peer P1 由组织 Org1 拥有，则认可 E1 对应于数字证明“在 ledger L1 上的交易 T1 响应 R1 已由 Org1 的 peer P1 提供”。

阶段 1 在应用程序收到来自足够 peer 的已签名 proposal response 时结束我们注意到，不同的 peer 可以针对相同的 transaction proposal 返回不同的 transaction response

https://hyperledger-fabric.readthedocs.io/en/latest/peers/peers.html#
