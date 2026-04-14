import { TreeNode } from '../models/tree-node.model';

export const MOCK_REGULATORY_DATA: TreeNode = {
  name: 'Basic Law for the Federal Republic of Germany',
  children: [
    {
      name: 'I. Basic Rights',
      children: [
        {
          name: 'Article 1 [Human dignity – Human rights – Legally binding force of basic rights]',
          children: [
            { name: '(1) Human dignity shall be inviolable. To respect and protect it shall be the duty of all state authority.' },
            { name: '(2) The German people therefore acknowledge inviolable and inalienable human rights as the basis of every community, of peace and of justice in the world.' },
            { name: '(3) The following basic rights shall bind the legislature, the executive and the judiciary as directly applicable law.' }
          ]
        },
        {
          name: 'Article 2 [Personal freedoms]',
          children: [
            { name: '(1) Every person shall have the right to free development of his personality insofar as he does not violate the rights of others or offend against the constitutional order or the moral law.' },
            { name: '(2) Every person shall have the right to life and physical integrity. Freedom of the person shall be inviolable. These rights may be interfered with only pursuant to a law.' }
          ]
        },
        {
          name: 'Article 3 [Equality before the law]',
          children: [
            { name: '(1) All persons shall be equal before the law.' },
            { name: '(2) Men and women shall have equal rights. The state shall promote the actual implementation of equal rights for women and men and take steps to eliminate existing disadvantages.' },
            { name: '(3) No person shall be favoured or disfavoured because of sex, parentage, race, language, homeland and origin, faith or religious or political opinions. No person shall be disfavoured because of disability.' }
          ]
        },
        {
          name: 'Article 4 [Freedom of faith and conscience]',
          children: [
            { name: '(1) Freedom of faith and of conscience and freedom to profess a religious or philosophical creed shall be inviolable.' },
            { name: '(2) The undisturbed practice of religion shall be guaranteed.' },
            { name: '(3) No person shall be compelled against his conscience to render military service involving the use of arms. Details shall be regulated by a federal law.' }
          ]
        }
      ]
    }
  ]
};
